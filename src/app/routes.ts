import { createBrowserRouter } from "react-router";
import LoginForm from "./components/LoginForm";
import TeamSelection from "./components/TeamSelection";
import GuideSelection from "./components/GuideSelection";
import ConfirmationPage from "./components/ConfirmationPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginForm,
  },
  {
    path: "/team",
    Component: TeamSelection,
  },
  {
    path: "/guide",
    Component: GuideSelection,
  },
  {
    path: "/confirm",
    Component: ConfirmationPage,
  },
]);