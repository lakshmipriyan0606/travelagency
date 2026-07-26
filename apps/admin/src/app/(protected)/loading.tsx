export default function AdminLoading() {
  return (
    <div className="w-full h-full flex flex-col gap-6 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-64 bg-gray-200 rounded-lg w-full mt-6"></div>
    </div>
  );
}
