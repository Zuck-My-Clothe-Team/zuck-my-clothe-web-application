import LoginPage from "./pages/LoginPage";
import Test from "./pages/Test";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return(
    <Router>
      <Test />
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  )

}

export default App;
