type StatusCheckBoxProps = {
  id?: string;
  label: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

const StatusCheckBox: React.FC<StatusCheckBoxProps> = ({
  disabled = false,
  ...props
}) => {
  const labelId = props.id ? `${props.id}-${props.label}` : undefined;
  return (
    <label
      htmlFor={labelId}
      className={`py-4 px-5 rounded-md lg:rounded-2xl bg-white ${
        props.checked || disabled
          ? "text-customgray-400 cursor-not-allowed"
          : "text-black cursor-pointer"
      } flex flex-row items-center`}
    >
      <span className="mr-2">{props.label}</span>
      <input
        id={labelId}
        type="checkbox"
        disabled={disabled}
        checked={props.checked}
        onChange={(e) => {
          if (!disabled) {
            props.onChange(e.target.checked);
          }
        }}
        className="appearance-none ml-auto rounded-md size-8 border-2 border-primaryblue-300 focus:ring-2 focus:ring-primaryblue-300 hover:bg-primaryblue-300/20 checked:bg-primaryblue-300 checked:border-primaryblue-300 checked:text-primaryblue-300/80 disabled:ring-customgray-400 disabled:border-customgray-400 disabled:bg-customgray-100 custom-checkbox"
      />
    </label>
  );
};

export default StatusCheckBox;
