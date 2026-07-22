import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppToastContainer: React.FC = () => {
  return (
    <ToastContainer
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      theme="light"
    />
  );
};

export default AppToastContainer;
