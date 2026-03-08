import { Routes, Route } from "react-router-dom";
import ParallaxBackground from "./components/ParallaxBackground";
import Home from "./pages/Home";
import Generator from "./pages/Generator";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <>
      <ParallaxBackground />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generator" element={<Generator />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}
