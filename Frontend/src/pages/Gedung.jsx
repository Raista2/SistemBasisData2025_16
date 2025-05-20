import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GedungService from '../services/GedungService';

const Gedung = () => {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                setLoading(true);
                const data = await GedungService.getAllGedung();
                setBuildings(data);
            } catch (err) {
                setError('Failed to load buildings. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBuildings();
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
        <div className="pt-16 container mx-auto px-4 py-8">
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