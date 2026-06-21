import { useEffect, useState } from "react";
import axiosClient from "./api/axiosClient";

function App() {
  const [foods, setFoods] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const { data } = await axiosClient.get("/foods");
        setFoods(data);
        setStatus("ready");
      } catch (err) {
        setError(err.message);
        setStatus("error");
      }
    };
    fetchFoods();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 text-gray-800">
      <header className="bg-orange-500 text-white shadow-md">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center gap-3">
          <span className="text-3xl">🍔</span>
          <h1 className="text-2xl font-bold">FoodHub</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Menu</h2>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              status === "ready"
                ? "bg-green-100 text-green-700"
                : status === "error"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            API: {status}
          </span>
        </div>

        {status === "error" && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-medium">Could not reach the backend.</p>
            <p className="text-sm">{error}</p>
            <p className="mt-2 text-sm">
              Make sure the backend is running on{" "}
              <code className="rounded bg-red-100 px-1">http://localhost:5050</code>{" "}
              and MongoDB is connected.
            </p>
          </div>
        )}

        {status === "ready" && foods.length === 0 && (
          <div className="rounded-lg border border-dashed border-orange-300 bg-white/60 p-8 text-center text-gray-500">
            No foods yet. Add some via{" "}
            <code className="rounded bg-orange-100 px-1">POST /api/foods</code>.
          </div>
        )}

        <ul className="grid gap-4 sm:grid-cols-2">
          {foods.map((food) => (
            <li
              key={food._id}
              className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">{food.name}</h3>
                <span className="font-bold text-orange-600">
                  ${Number(food.price).toFixed(2)}
                </span>
              </div>
              {food.description && (
                <p className="mt-1 text-sm text-gray-500">{food.description}</p>
              )}
              <span className="mt-3 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                {food.category}
              </span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default App;
