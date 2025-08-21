import { useSelector } from "react-redux";

export default function useAuth() {
  const user = useSelector((s) => s.user);
  const settings = useSelector((s) => s.settings);
  return { user, settings };
}
