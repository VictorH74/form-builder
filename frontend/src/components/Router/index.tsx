import React, { lazy, Suspense } from 'react';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import LoggedLayout from "../Layout";
import Loading from '../Loading';

const Authenticate = lazy(() => import('@/pages/Authenticate'));
const Home = lazy(() => import('@/pages/Home'));
const FormList = lazy(() => import('@/pages/FormList'));
const AddForm = lazy(() => import('@/pages/FormList/components/AddForm'));
const RetrievedForm = lazy(() => import('@/pages/RetrievedForm'));
const Themes = lazy(() => import('@/pages/Themes'));
const About = lazy(() => import('@/pages/About'));


// const Themes = lazy(() =>
//     new Promise((resolve) => {
//         setTimeout(() => resolve(import('@/pages/Themes')), 2000);
//     })
// );


const CustomSuspense: React.FC<{ element: JSX.Element }> = ({ element }) => {
    const Element = element
    return (
        <Suspense fallback={
            <Loading />
        }>
            <Element />
        </Suspense>
    )
}


const router = createBrowserRouter([
    {
        path: "/",
        children: [
            {
                element: <LoggedLayout />,
                children: [
                    {
                        path: "",
                        element: <CustomSuspense element={Home} />,
                    },
                    {
                        path: "themes",
                        element: <CustomSuspense element={Themes} />,
                    },
                    {
                        path: "about",
                        element: <CustomSuspense element={About} />,
                    },
                    {
                        path: "my-forms/",
                        children: [
                            {
                                path: "",
                                element: <CustomSuspense element={FormList} />
                            },
                            {
                                path: ":formId",
                                element: <CustomSuspense element={RetrievedForm} />
                            },
                            {
                                path: "add",
                                element: <CustomSuspense element={AddForm} />
                            },
                        ]
                    },
                ]
            },
            {
                path: "authentication",
                element: <CustomSuspense element={Authenticate} />,
            },
        ]
        // errorElement: <ErrorPage />,
    },

]);

const Router: React.FC<{}> = () => (<RouterProvider router={router} />)

export default Router