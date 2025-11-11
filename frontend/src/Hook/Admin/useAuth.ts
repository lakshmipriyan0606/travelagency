import { useMutation, useQuery } from "@tanstack/react-query";
import { loginAPI, logoutAPI, currentUserAPI } from "../../api/admin/auth.api";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "@/store/authSlice";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: currentUserAPI,
  });
};

export const useLogin = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: loginAPI,
    onSuccess: (data) => {
      dispatch(setUser(data.user));
    },
  });
};

export const useLogout = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: logoutAPI,
    onSuccess: () => {
      dispatch(clearUser());
    },
  });
};
