import { Outlet } from "react-router-dom";
import background from '../assets/background-gedung-ftui.jpg';

export default function Layout() {
    return (
        <div
            className="min-h-screen w-full bg-fixed bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${background})` }}
        >
                <Outlet />
        </div>
    );
}
