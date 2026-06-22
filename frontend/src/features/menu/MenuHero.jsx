import { useAuth } from "../../context/AuthContext";
import SearchBar from "./SearchBar";
import { HERO_IMAGE } from "../../lib/categoryImages";

/** Banner đầu trang thực đơn: ảnh nền + lời chào + ô tìm kiếm. */
export default function MenuHero({ search, onSearch }) {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden rounded-3xl shadow-sm">
      <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/95 via-primary-dark/75 to-primary/40" />
      <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16">
        {user && (
          <p className="text-sm font-medium text-white/80">Xin chào, {user.fullName} 👋</p>
        )}
        <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
          Hôm nay bạn muốn dùng gì?
        </h1>
        <p className="mt-2 max-w-md text-sm text-white/85 sm:text-base">
          Cà phê, trà sữa, nước ép &amp; món vặt — chọn món yêu thích và đặt ngay tại bàn.
        </p>
        <div className="mt-6 max-w-md">
          <SearchBar
            value={search}
            onChange={onSearch}
            placeholder="Tìm cà phê, trà sữa, món vặt..."
          />
        </div>
      </div>
    </section>
  );
}
