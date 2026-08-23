import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorApi, adminApi } from '../../api/services';
import { Doctor, Specialization } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, Stethoscope, Star, Calendar, ShieldCheck, Clock } from 'lucide-react';

export const DoctorSearchPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSpecializations();
    fetchDoctors();
  }, [selectedSpec]);

  const fetchSpecializations = async () => {
    try {
      const res = await adminApi.getSpecializations();
      if (res.success) setSpecializations(res.data.specializations);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const res = await doctorApi.getDoctors({
        specialization: selectedSpec || undefined,
        search: searchQuery || undefined,
      });
      if (res.success) setDoctors(res.data.doctors);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Find & Book Specialist Doctors</h1>
            <p className="text-slate-400 mt-1">Filter by specialization, experience, and view dynamic available time slots.</p>
          </div>

          {/* Search Bar & Filter Bar */}
          <div className="glass-panel-accent rounded-3xl p-5 shadow-xl mb-8 space-y-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search doctor by name or bio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-500"
                />
              </div>
              <Button type="submit" size="md" className="px-6 shadow-glow-brand" variant="gradient">Search</Button>
            </form>

            {/* Specialization Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/80">
              <button
                onClick={() => setSelectedSpec('')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  selectedSpec === ''
                    ? 'bg-brand-500 text-white border-brand-500 shadow-glow-brand'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border-slate-700'
                }`}
              >
                All Specializations
              </button>
              {specializations.map((spec) => (
                <button
                  key={spec._id}
                  onClick={() => setSelectedSpec(spec._id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    selectedSpec === spec._id
                      ? 'bg-brand-500 text-white border-brand-500 shadow-glow-brand'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border-slate-700'
                  }`}
                >
                  {spec.name}
                </button>
              ))}
            </div>
          </div>

          {/* Doctors Cards Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-panel-accent h-64 rounded-3xl border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : doctors.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="glass-panel-accent border-glow-brand rounded-3xl p-6 shadow-xl hover-glow-effect flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white font-bold text-2xl flex items-center justify-center shadow-lg shrink-0">
                        {doctor.userId?.name?.charAt(0) || 'D'}
                      </div>
                      <Badge variant="info">{doctor.specializationIds?.[0]?.name || 'Specialist'}</Badge>
                    </div>

                    <h3 className="text-lg font-bold text-white">{doctor.userId?.name}</h3>
                    <p className="text-xs text-sky-400 font-bold mb-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {doctor.experience} years clinical experience
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">{doctor.bio}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Fee</span>
                      <p className="text-lg font-extrabold text-white">₹{doctor.consultationFee}</p>
                    </div>
                    <Button
                      size="sm"
                      className="shadow-glow-brand"
                      variant="gradient"
                      leftIcon={<Calendar className="w-4 h-4" />}
                      onClick={() => navigate(`/book/${doctor._id}`)}
                    >
                      Book Slot
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-panel-accent rounded-3xl border border-slate-800 shadow-xl">
              <Stethoscope className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No Doctors Match Filters</h3>
              <p className="text-xs text-slate-400 mt-1">Try resetting your search query or selecting a different specialization.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
