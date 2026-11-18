import Spinner from "./Spinner.jsx";

export default function PageLoader({ label = "Memuat data..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <Spinner size="lg" />
      <p className="text-white text-sm font-semibold">{label}</p>
    </div>
  );
}
