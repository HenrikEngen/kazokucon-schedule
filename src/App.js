import React from "react";

import { init } from '@phoenixlan/phoenix.js';

import * as Sentry from "@sentry/react";
import { KazokuconInfo } from "./pages/scheduleapp";

export const BASE_URL = process.env.REACT_APP_API_URL??"http://api.test.phoenixlan.no:3000";

const initialize = () => {
  init(BASE_URL); //init(process.env.BASE_URL);
  if(process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
    });
  }
};
initialize();

export default function App() {
  return (
    <KazokuconInfo />
  );
}