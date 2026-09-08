import React, { useState, useEffect } from 'react';
import { Booking, BookingFormData, UserAccount } from '../../types';
import { bookingStorage } from '../../services/bookingStorage';
import { authStorage } from '../../services/authStorage';
import { themeStorage, BackgroundSettings } from '../../services/themeStorage';
import { getTodayDateString, isEligibleForMakanSiang } from '../../utils/timeUtils';
import { Step1JadwalRuangan } from './Step1JadwalRuangan';
import { Step2Konsumsi } from './Step2Konsumsi';
import { Step3Pemesan } from './Step3Pemesan';
import { BookingSuccess } from './BookingSuccess';
import { HeroBanner } from '../common/HeroBanner';
import { Layers, UtensilsCrossed, CheckCircle2 } from 'lucide-react';

interface BookingWizardProps {
  onCheckStatus: (bookingNumber: string) => void;
  onBookingCreated?: (booking: Booking) => void;
  currentUser?: UserAccount | null;
  onOpenSettings?: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  onCheckStatus,
  onBookingCreated,
  currentUser,
  onOpenSettings
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bgSettings, setBgSettings] = useState<BackgroundSettings>(() => themeStorage.getSettings());

  useEffect(() => {
    const unsub = themeStorage.subscribe((updated) => {
      setBgSettings(updated);
    });
    return () => unsub();
  }, []);

  const getInitialFormData = (): BookingFormData => {
    const user = currentUser || authStorage.getCurrentUser();
    const defaultStart = '09:00';
    const defaultDuration = 2;
    const lunchEligible = isEligibleForMakanSiang(defaultStart, defaultDuration).isEligible;

    return {
      meetingDate: getTodayDateString(),
      startTime: defaultStart,
      durationHours: defaultDuration,
      snackRingan: 'Snack Mix Basah Kering',
      snackBerat: 'Tidak Ada',
      makanSiang: lunchEligible ? 'Iya' : 'Tidak',
      bookerName: user?.name || '',
      department: user?.department || '',
      whatsapp: '',
      email: user?.email || '',
      meetingTitle: '',
      meetingLocation: '',
      participantCount: 20,
      organizationOrGuests: '',
      invitationLetter: null,
      attachments: [],
      notes: ''
    };
  };

  const [formData, setFormData] = useState<BookingFormData>(getInitialFormData);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync user info if currentUser changes and fields are empty
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        bookerName: prev.bookerName || currentUser.name,
        department: prev.department || currentUser.department,
        email: prev.email || currentUser.email || ''
      }));
    }
  }, [currentUser]);

  const handleFieldChange = (field: keyof BookingFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    try {
      const newBooking = bookingStorage.create(formData);
      setCreatedBooking(newBooking);
      if (onBookingCreated) {
        onBookingCreated(newBooking);
      }
    } catch (err) {
      console.error('Failed to create booking', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNew = () => {
    setFormData(getInitialFormData());
    setCreatedBooking(null);
    setStep(1);
  };

  if (createdBooking) {
    return (
      <BookingSuccess
        booking={createdBooking}
        onNewBooking={handleResetForNew}
        onCheckStatus={onCheckStatus}
      />
    );
  }

  const stepsList = [
    { num: '01', title: 'Jadwal & Ruangan', subtitle: 'Waktu & Ruang Rapat', icon: Layers },
    { num: '02', title: 'Konsumsi & Peserta', subtitle: 'Porsi & Pilihan Menu', icon: UtensilsCrossed },
    { num: '03', title: 'Data PIC & Konfirmasi', subtitle: 'Verifikasi & Kirim', icon: CheckCircle2 }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Welcome Banner showcasing PLTU Teluk Sirih */}
      {bgSettings.showHeroBanner && (
        <HeroBanner 
          currentUser={currentUser} 
          onOpenSettings={onOpenSettings} 
        />
      )}

      {/* Top Progress Step Indicator - 3 Steps */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs p-2.5 sm:p-4 w-full max-w-full">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full">
          {stepsList.map((item, idx) => {
            const stepNum = (idx + 1) as 1 | 2 | 3;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            const Icon = item.icon;

            return (
              <div
                key={item.num}
                id={`step-indicator-${item.num}`}
                className={`relative flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2.5 p-2 sm:p-3 rounded-xl transition-all min-w-0 ${
                  isActive
                    ? 'bg-indigo-50/80 border border-indigo-200 text-indigo-900 ring-1 ring-indigo-500/20 shadow-2xs'
                    : isCompleted
                    ? 'bg-slate-50 border border-slate-200/60 text-slate-700'
                    : 'text-slate-400 border border-transparent'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : item.num}
                </div>

                <div className="text-center sm:text-left min-w-0 flex-1">
                  <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wider truncate">
                    <span className="hidden sm:inline">{item.num} </span>{item.title}
                  </span>
                  <span className="hidden md:block text-[11px] text-slate-500 truncate mt-0.5">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step View Container */}
      <div className="transition-all">
        {step === 1 && (
          <Step1JadwalRuangan
            formData={formData}
            onChange={handleFieldChange}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <Step2Konsumsi
            formData={formData}
            onChange={handleFieldChange}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <Step3Pemesan
            formData={formData}
            onChange={handleFieldChange}
            onBack={() => setStep(2)}
            onConfirm={handleConfirmSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};
