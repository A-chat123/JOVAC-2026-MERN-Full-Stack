import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FacialExpression from './Components/FacialExpression'
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Admin from './Components/Admin'

function App() {
  let routes=createBrowserRouter([
    {
      path:"/",
      element:<FacialExpression/>
    },
    {
      path:"/wp-admin",
      element:<Admin/>
    }
  ])

  return (
    <>
      <RouterProvider router={routes}/>
    </>
  )
}

export default App
