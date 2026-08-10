interface IProps {
  msg?: string;
  className?: string;
}

const InputErrorMessage = ({ msg, className = "" }: IProps) => {
  return msg ? (
    <span className={`block text-red-600 font-medium text-xs leading-normal mt-1 ${className}`.trim()}>
      {msg}
    </span>
  ) : null;
};

export default InputErrorMessage;