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
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)] pt-16 bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pt-16 container mx-auto px-4 py-8 bg-white text-gray-800">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 container mx-auto px-4 py-8 bg-white text-gray-800">
            <h1 className="text-3xl font-bold mb-6 text-primary-blue text-center">Daftar Gedung</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Gedung</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Ruangan</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Operasional</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {buildings.map((building) => (
                            <tr key={building.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <Link
                                        to={`/ruangan/${building.id}`}
                                        className="text-primary-blue hover:bg-primary-blue hover:text-white py-1 px-2 rounded transition-colors"
                                    >
                                        {building.name}
                                    </Link>
                                </td>
                                <td className="py-3 px-4">{building.location}</td>
                                <td className="py-3 px-4 text-center">{building.roomCount}</td>
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