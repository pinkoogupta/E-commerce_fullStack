import { createContext,useEffect,useState } from "react";
import { products } from "../assets/assets";
import { toast } from "react-toastify";
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {backendUrl} from '../config/config';
export const ShopContext =createContext();

const ShopContextProvider =({children})=>{
    const currency ='$';
    const deliveryFee =10;

    const[search,setSearch]=useState('');
    const[showSearch,setShowSearch]=useState(false);
    const [cartItem,setCartItems]=useState({});
    const [products,setProducts]=useState([]);
    const [token,setToken]=useState('');


    const navigate=useNavigate();


    const addToCart = async(itemId,size)=>{
        if(!size){
            toast.error('Select Product Size')
            return;
        }

        let cartData=structuredClone(cartItem)
        if(cartData[itemId]){
            if(cartData[itemId][size]){
                cartData[itemId][size]+=1
            }
            else{
                cartData[itemId][size]=1
            }
        }
        else{
            cartData[itemId]={};
            cartData[itemId][size]=1
        }
        setCartItems(cartData);

        if(token)
        {
            try {
                const response =await axios.post(backendUrl+'/api/v1/cart/add',
                     {itemId,size},
                     {headers:
                        {token}
                    })
                    console.log(response.data);
                    toast.success(response.data.message);
                    } catch (error) {
                 console.log(error);
                 toast.error(error.message);
            }
        }
    }
    
const getCartCount=()=>{
    let totalCount = 0
    for(const items in cartItem){
        for(const item in cartItem[items]){
            try {
                if(cartItem[items][item]>0){
                    totalCount+=cartItem[items][item]
                }
            } catch (error) {
                console.log(error);
                
            }
        }
    }
    return totalCount
}

const updateQuantity =async(itemId,size,quantity)=>{
    let cartData=structuredClone(cartItem)
    cartData[itemId][size]=quantity
    setCartItems(cartData)

    if(token)
    {
        try {
            const response =await axios.post(backendUrl+'/api/v1/cart/update',
                 {itemId,size,quantity},
                 {headers:
                    {token}
                })
                // console.log(response.data);
                // toast.success(response.data.message);
                } catch (error) {
             console.log(error);
             toast.error(error.message);
        }
    }
}
const getCartAmount =()=>{
    let totalAmount=0
    for(const items in cartItem){
        let itemInfo=products.find((product)=> product._id===items);
        for(const item in cartItem[items]){
            try {
                if(cartItem[items][item]>0){
                    totalAmount+=itemInfo.price*cartItem[items][item];
                }
            } catch (error) {
                console.log(error);
                
            }
        }
    }
    return totalAmount;
}

const getProductsData=async()=>{
    try {
        const response =await axios.get(backendUrl+'/api/v1/product/list');
        // console.log(response.data);
        if(response.data.success)
        {
            setProducts(response.data.products);
        }else{
            toast.error(response.data.message);
        }

    } catch (error) {
        console.log(error);
        toast.error(error.message);
    }
}

const getUserCart=async(token)=>{
    try {
        const response=await axios.post(backendUrl+'/api/v1/cart/get',{},{headers:{token}});
        if(response.data.success)
        {
            setCartItems(response.data.cartData);
            toast.success(response.data.message);
        }
    } catch (error) {
        console.log(error);
        toast.error(error.message);
    }
}


 useEffect(()=>{
    getProductsData();
 },[]);


//  console.log("cartItem",cartItem);
//  console.log("getCartCount",getCartCount);
//  console.log("getCartAmount",getCartAmount);
 

useEffect(()=>{
  if(!token && localStorage.getItem('token'))
  {
    setToken(localStorage.getItem('token'));
    getUserCart(localStorage.getItem('token'));
  }
},[])

const value={
        products,currency,deliveryFee,updateQuantity,
        getCartAmount,navigate,search,setSearch,
        showSearch,setShowSearch,cartItem,addToCart,
        getCartCount,backendUrl,setToken,token,setCartItems
    }
    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    )
} 

export default ShopContextProvider;
