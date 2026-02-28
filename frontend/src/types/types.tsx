import { ReactNode, LazyExoticComponent } from "react";
export interface AppRoute {
    path: string;
    element: ReactNode | LazyExoticComponent<() => ReactNode>;
    isProtectRoute?: boolean;
    children?: AppRoute[];
}

export interface NavbarConfigList {
    name: string,
    key: string,
    path: string,
}
