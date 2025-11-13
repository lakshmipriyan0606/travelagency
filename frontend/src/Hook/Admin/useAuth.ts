import { useMutation, useQuery } from "@tanstack/react-query";
import { loginAPI, logoutAPI, currentUserAPI } from "../../api/admin/auth.api";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "@/store/authSlice";

export const useLogin = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: loginAPI,
    onSuccess: (data) => {
      dispatch(setUser(data.user));
    },
  });
};
