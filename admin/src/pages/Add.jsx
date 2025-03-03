import React from 'react'
import {assets} from '../assets/assets'
import { useState } from 'react'
import axios from 'axios'
import {backendUrl} from '../config/config'
import {toast} from 'react-toastify'
const Add = ({token}) => {
   
  const [image1,setImage1]=useState(null);
  const [image2,setImage2]=useState(null);
  const [image3,setImage3]=useState(null);
  const [image4,setImage4]=useState(null);


  const [name,setName]=useState("");
  const [description,setDescription]=useState("");
  const [price,setPrice]=useState("");
  const [category,setCategory]=useState("Men");
  const [subCategory,setSubCategory]=useState("Topwear");
  const [BestSeller,setBestSeller]=useState(false);
  const [sizes,setSizes]=useState([]);
 



   const onSubmitHandler=async (e)=>{
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);  
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("BestSeller", BestSeller);
      formData.append("sizes", JSON.stringify(sizes));


      image1 &&formData.append("image1", image1);
      image2 &&formData.append("image2", image2);
      image3 &&formData.append("image3", image3);
      image4 &&formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/v1/product/addProduct",
        formData,
        {
          headers: {token}
        }
      );
      if(response.data.success){
        toast.success(response.data.message);
        setName("");
        setDescription("");   
        setImage1(null);
        setImage2(null);    
        setImage3(null);
        setImage4(null);
        setPrice("");
      }
      else{
        toast.error(response.data.message); 
      }
      // console.log(response.data);
      // console.log(token);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }

   }

  
  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div>
        <p className='mb-2'>Upload Image</p>
        <div className='flex gap-2'>
          <label htmlFor="Image1">
            <img className='w-20' src={!image1 ? assets.upload_area:URL.createObjectURL(image1)} alt="" />
            <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id="Image1" hidden />
          </label>
          <label htmlFor="Image2">
            <img className='w-20' src={!image2 ? assets.upload_area:URL.createObjectURL(image2)} alt="" />
            <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id="Image2" hidden />
          </label>
          <label htmlFor="Image3">
            <img className='w-20' src={!image3 ? assets.upload_area:URL.createObjectURL(image3)} alt="" />
            <input onChange={(e)=>setImage3(e.target.files[0])} type="file" id="Image3" hidden />
          </label>
          <label htmlFor="Image4">
            <img className='w-20' src={!image4 ? assets.upload_area:URL.createObjectURL(image4)} alt="" />
            <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id="Image4" hidden />
          </label>
        </div>
      </div>
      <div className='w-full'>
        <p className='mb-2'>Product Name</p>
        <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required />
      </div>
      <div className='w-full'>
        <p className='mb-2'>Product Description</p>
        <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Write content here' required />
      </div>
     <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
      <div>
        <p className='mb-2'>Product category</p>
        <select onChange={(e)=>setCategory(e.target.value)} className='w-full px-3 py-2' >
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
        </select>
      </div>
      <div>
        <p className='mb-2'>Sub category</p>
        <select onChange={(e)=>setSubCategory(e.target.value)} className='w-full px-3 py-2' >
          <option value="Topwear">Topwear</option>
          <option value="Bottomwear">Bottomwear</option>
          <option value="Underwear">Underwear</option>
        </select>
      </div>
      <div>
        <p className='mb-2'>Product Price</p>
        <input onChange={(e)=>setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='25'/>
      </div>
      </div> 

      <div>
  <p className='mb-2'>Product Sizes</p>
  <div className='flex gap-3'>
    <div onClick={() => setSizes(prev => prev.includes("S") ? prev.filter(item => item !== "S") : [...prev, "S"])}>
      <p className={`${sizes.includes("S") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>S</p>
    </div>
    <div onClick={() => setSizes(prev => prev.includes("M") ? prev.filter(item => item !== "M") : [...prev, "M"])}>
      <p className={`${sizes.includes("M") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>M</p>
    </div>
    <div onClick={() => setSizes(prev => prev.includes("L") ? prev.filter(item => item !== "L") : [...prev, "L"])}>
      <p className={`${sizes.includes("L") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>L</p>
    </div>
    <div onClick={() => setSizes(prev => prev.includes("XL") ? prev.filter(item => item !== "XL") : [...prev, "XL"])}>
      <p className={`${sizes.includes("XL") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>XL</p>
    </div>
    <div onClick={() => setSizes(prev => prev.includes("XXL") ? prev.filter(item => item !== "XXL") : [...prev, "XXL"])}>
      <p className={`${sizes.includes("XXL") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>XXL</p>
    </div>
  </div>
</div>


      <div className='flex gap-2 mt-2'>
        <input onChange={()=>setBestSeller(prev=> !prev)} checked={BestSeller} type='checkbox' id='BestSeller'/>
        <label className='cursor-pointer' htmlFor="BestSeller">Add to BestSeller</label>
      </div>

      <button type="submit" className='w-28 py-3 mt-4 bg-black text-white' >Add</button>
    </form>
  )
}

export default Add;