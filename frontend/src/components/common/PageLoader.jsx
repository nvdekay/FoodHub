import Spinner from "../ui/Spinner";

/** Fallback khi tải trang (lazy route). */
export default function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-8 w-8 text-primary" />
    </div>
  );
}
