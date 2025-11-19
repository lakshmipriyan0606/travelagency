import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { GetAllBookings } from "@/api/admin/auth.api";

export default function BookingAdminPage() {
    const [selected, setSelected] = useState(null);

    const { data, isLoading, isError } = UseFetchAPIQuery({
        key: ["allBookings"],
        queryFn: GetAllBookings,
    })

    if (isLoading) return <div className="flex justify-center py-10">
        <Loader2 className="animate-spin w-10 h-10" /> Booking list
    </div>
    if (isError) return <p>Error loading  Booking list</p>;


    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Bookings</h1>

            <Card className="shadow-xl rounded-2xl font-roboto">
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left">Booking ID</th>
                                    <th className="p-3 text-left">Name</th>
                                    <th className="p-3 text-left">Email</th>
                                    <th className="p-3 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.bookings.map((b:any) => (
                                    <tr key={b._id} className="border-t hover:bg-gray-50">
                                        <td className="p-3">{b.bookingId}</td>
                                        <td className="p-3">{b.name}</td>
                                        <td className="p-3">{b.email}</td>
                                        <td className="p-3">
                                            <Button onClick={() => setSelected(b)}>View</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table >
                    </div >
                </CardContent >
            </Card >

            <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent className="max-w-xl bg-white text-black font-roboto">
                    <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                    </DialogHeader>

                    {selected && (
                        <div className="space-y-3 text-base">
                            <p><strong>ID:</strong> {selected.bookingId}</p>
                            <p><strong>Name:</strong> {selected.name}</p>
                            <p><strong>Email:</strong> {selected.email}</p>
                            <p><strong>Phone Number:</strong> {selected.phone}</p>
                            <p><strong>Whatsapp number:</strong> {selected.whatsapp}</p>
                            <p><strong>City:</strong> {selected.city}</p>
                            <p><strong>Destination:</strong> {selected.destination}</p>
                            <p><strong>Travel Date:</strong> {new Date(selected.travelDate).toLocaleString()}</p>
                            <p><strong>Vacation Type:</strong> {selected?.vacationType}</p>
                            <p><strong>No Of People:</strong> {selected?.noOfPeople}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
}
