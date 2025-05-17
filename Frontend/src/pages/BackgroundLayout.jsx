import { Outlet } from "react-router-dom"
import background from '../assets/background-gedung-ftui.jpg'

export default function Layout() {
    return (
        <div
            className="min-h-screen w-full bg-fixed bg-cover bg-center bg-no-repeat flex md:px-10 lg:px-20 xl:px-40 mt-6 -mb-8"
            style={
                { backgroundImage: `url(${background})` }
            }
        >
                <Outlet />
        </div>
    );
}