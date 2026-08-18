import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import UsuarioChamados from "./pages/UsuarioChamados"

function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login"/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="/usuario" element={<UsuarioChamados/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App
