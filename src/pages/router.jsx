import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams
  } from "react-router-dom";
import { KazokuconInfo } from "./scheduleapp";

export const InfoRouter = () => {

    return (
        <Router>
            <Switch>
                <Link to="/" component={KazokuconInfo} />
            </Switch>
        </Router>
    )

}