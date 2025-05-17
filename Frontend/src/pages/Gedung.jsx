import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Gedung = () => {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Mock function to simulate API call
        const fetchBuildingsMock = () => {
            // Mock data
            const mockBuildings = [
                {
                    id: 1,
                    name: "Gedung S",
                    location: "Dimana ya",
                    roomCount: 15,
                    operationHours: "08:00 - 17:00"
                },
                {
                    id: 2,
                    name: "Gedung K",
                    location: "Di FT",
                    roomCount: 10,
                    operationHours: "08:00 - 20:00"
                },
                {
                    id: 3,
                    name: "Gedung GK",
                    location: "Depannya G Belakangnya K",
                    roomCount: 8,
                    operationHours: "08:00 - 16:00"
                }
            ];

            // Simulate API delay
            setTimeout(() => {
                setBuildings(mockBuildings);
                setLoading(false);
            }, 700);
        };

        fetchBuildingsMock();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] pt-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pt-16 container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 container mx-auto px-4 py-8 md:p-10 lg:p-20">
            <h1 className="text-3xl font-bold mb-6 text-black">Daftar Gedung</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden text-black">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left">Nama Gedung</th>
                            <th className="py-3 px-4 text-left">Lokasi</th>
                            <th className="py-3 px-4 text-left">Jumlah Ruangan</th>
                            <th className="py-3 px-4 text-left">Jam Operasional</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buildings.map((building) => (
                            <tr key={building.id} className="border-t hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <Link
                                        to={`/ruangan/${building.id}`}
                                        className="text-blue-600 hover:underline font-medium"
                                    >
                                        {building.name}
                                    </Link>
                                </td>
                                <td className="py-3 px-4">{building.location}</td>
                                <td className="py-3 px-4">{building.roomCount}</td>
                                <td className="py-3 px-4">{building.operationHours}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Gedung;