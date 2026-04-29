import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import HospitalList from "./pages/HospitalList";
import Campus from "./pages/Campus";
import Triage from "./pages/Triage";
import Doctor from "./pages/Doctor";
import DoctorList from "./pages/DoctorList";
import Plan from "./pages/Plan";
import Checkin from "./pages/Checkin";
import Data from "./pages/Data";
import Profile from "./pages/Profile";
import Bind from "./pages/Bind";
import ChatHistory from "./pages/ChatHistory";
import MealPackages from "./pages/MealPackages";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Devices from "./pages/Devices";
import Addresses from "./pages/Addresses";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter(
  [
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Auth },
      { path: "auth", Component: Auth },
      { path: "hospitals", Component: HospitalList },
      { path: "campus", Component: Campus },
      { path: "chat", Component: Home },
      { path: "bind", Component: Bind },
      { path: "triage", Component: Triage },
      { path: "doctors", Component: DoctorList },
      { path: "doctor/:id", Component: Doctor },
      { path: "plan", Component: Plan },
      { path: "meal-packages", Component: MealPackages },
      { path: "orders", Component: Orders },
      { path: "order-detail/:id", Component: OrderDetail },
      { path: "checkin", Component: Checkin },
      { path: "data", Component: Data },
      { path: "profile", Component: Profile },
      { path: "profile/devices", Component: Devices },
      { path: "profile/orders", Component: Orders },
      { path: "profile/addresses", Component: Addresses },
      { path: "chat-history/:id", Component: ChatHistory },
      { path: "*", Component: NotFound },
    ],
  },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' }
);