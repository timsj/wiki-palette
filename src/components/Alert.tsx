import { useAppContext } from "../context/appContext";

//reusable Alert component based on global state
const Alert = () => {
  const { alertType, alertText } = useAppContext();
  return <div className={`alert alert-${alertType}`}>{alertText}</div>;
};

export default Alert;
