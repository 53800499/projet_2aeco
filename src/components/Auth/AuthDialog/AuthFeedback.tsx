import { Icon } from "@iconify/react/dist/iconify.js";

interface AuthFeedbackProps {
  type: "success" | "error";
  message: string;
}

export const AuthFeedback = ({ type, message }: AuthFeedbackProps) => {
  const isSuccess = type === "success";

  return (
    <div
      className={`mx-auto inline-block max-w-lg rounded-md p-4 text-white shadow-lg ${
        isSuccess ? "bg-green-500" : "bg-red-500"
      }`}
      role="alert"
      aria-live="polite">
      <div className="flex items-center gap-3">
        <Icon
          icon={isSuccess ? "ep:success-filled" : "carbon:close-filled"}
          className="shrink-0 text-xl"
        />
        <p className="text-left text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};
