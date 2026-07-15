import type { ActionDef } from "../../interface";

interface ActionDropdownItemProps<T> {
  action: ActionDef<T>;
  row: T;
  onClose: () => void;
}

const ActionDropdownItem = <T,>({
  action,
  row,
  onClose,
}: ActionDropdownItemProps<T>) => {
  const handleClick = () => {
    if (action.disabled) return;

    action.onClick(row);
    onClose();
  };

  return (
    <button
      type="button"
      disabled={action.disabled}
      onClick={handleClick}
      className={`
        w-full flex items-center gap-2 px-3 py-2
        text-sm text-left
        hover:bg-light-primary
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${action.className ?? ""}
      `}
    >
      {action.icon && (
        <span className="flex items-center justify-center">
          {action.icon}
        </span>
      )}

      <span>{action.label}</span>
    </button>
  );
};

export default ActionDropdownItem;