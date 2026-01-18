import { useAlertState } from "../context/appContext";

//reusable Alert component based on global state
const Alert = () => {
  const { alertType, alertText } = useAlertState();
  return <div className={`alert alert-${alertType}`}>{alertText}</div>;
};

export default Alert;
