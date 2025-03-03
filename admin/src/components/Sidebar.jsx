import React from 'react'
import {NavLink} from 'react-router-dom'
import {assets} from '../assets/assets.js'
const Sidebar = () => {
  return (
    <div  className='w-[18%] min-h-screen border-r-2'>
       <div className='flex flex-col gap-4 mt-6 pl-[20%] text-[15px]'>
          <NavLink className='flex item-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1' to='/add'>
             <img src={assets.add_icon} alt="" />
             <p className='hidden md:block'>Add Items</p>
          </NavLink>

          <NavLink className='flex item-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1' to='/list'>
             <img src={assets.order_icon} alt="" />
             <p className='hidden md:block'>List Items</p>
          </NavLink>

          <NavLink className='flex item-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-1' to='/orders'>
             <img src={assets.order_icon} alt="" />
             <p className='hidden md:block'>Orders</p>
          </NavLink>
       </div>
    </div>
  )
}

export default Sidebar;