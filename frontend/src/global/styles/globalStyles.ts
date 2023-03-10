import styled, { createGlobalStyle } from "styled-components";
import { Link } from "react-router-dom";

export const GlobalStyles = createGlobalStyle`
    :root {
        --mainColor: #E11D48;
        font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 24px;
        font-weight: 400;

        color-scheme: light dark;
        color: rgba(255, 255, 255, 0.87);
        background-color: #242424;

        font-synthesis: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        -webkit-text-size-adjust: 100%;
    }

    * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        z-index: 1;
    }

    h1 {
        font-size: 3.2em;
        line-height: 1.1;
    }

    ::-webkit-scrollbar {
        background-color: transparent;
        width: 10px;
    }
    ::-webkit-scrollbar-thumb{
        background-color: var(--mainColor);
        border-radius: 5px;
    }

`;

export const Backward = styled(Link)`
    position: absolute;
    top: 0;
    left: 20px;
    cursor: pointer;
    transition: 300ms;

    &:hover {
        translate: -5px 0;
        
    }
`;

// export const Label = styled.label`
//     display: flex;
//     margin-top: 4px;
//     margin-bottom: 20px;
//     flex-direction: column;
//     width: auto;
//     &.checkbox-container {
//         position: relative;
//         display: block;
//         padding-left: 35px;
//         margin: 15px 0;
//         color: #858585;
//         cursor: pointer;
//         font-weight: 400;
//         font-size: 16px;
//         -webkit-user-select: none;
//         -moz-user-select: none;
//         -ms-user-select: none;
//         user-select: none;
//         & a {
//           color: #547B96;
//           font-weight: 500;
//         }
//         input {
//             position: absolute;
//             height: 0;
//             width: 0;
//             opacity: 0;
//             cursor: pointer;
//         }
//         &:hover input~span { background-color: #858585; }
//         input:checked~span { background-color: #547B96; }
//         input:checked~span:after { display: block; }
//     }
// `;
