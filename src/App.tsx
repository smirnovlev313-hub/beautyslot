import React, { useState } from 'react';
import './App.css';

interface Service {
  id: string;
  category: 'lash' | 'lam';
  title: string;
  volume: string;
  price: number;
  duration: string;
  badge?: string;
}

const SERVICES: Service[] = [
  { id: '1', category: 'lash', volume: '1D Классика', title: 'Наращивание ресниц', price: 1600, duration: '1 ч 30 мин' },
  { id: '2', category: 'lash', volume: '1.5D – 2D Объём', title: 'Наращивание ресниц', price: 1700, duration: '1 ч 30 мин', badge: 'Хит' },
  { id: '3', category: 'lash', volume: '2.5D – 3D Объём', title: 'Наращивание ресниц', price: 1800, duration: '1 ч 30 мин', badge: 'Топ' },
  { id: '4', category: 'lash', volume: '3.5D – 4D Мегаобъём', title: 'Наращивание ресниц', price: 1900, duration: '1 ч 30 мин' },
  { id: '5', category: 'lam', volume: 'Ламинирование', title: 'Ламинирование верхних ресниц', price: 1000, duration: '50 мин' },
];

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const SLOTS = ['10:00', '12:00', '14:30', '17:00', '19:30'];

const TG_BOT_TOKEN = '9222861262:AAG9MIz2FGcYqs7s4wyEIVr3AoLPQhpqeck';
const TG_CHAT_ID = '5756663114';

export default function App() {
  const [activeTab, setActiveTab] = useState<'all' | 'lash' | 'lam'>('all');
  const [selectedService, setSelectedService] = useState<Service>(SERVICES[1]);

  const now = new Date();

  const currentMonthObj = { year: now.getFullYear(), month: now.getMonth() };
  const nextMonthObj = {
    year: now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(),
    month: (now.getMonth() + 1) % 12,
  };

  const [viewYear, setViewYear] = useState<number>(currentMonthObj.year);
  const [viewMonth, setViewMonth] = useState<number>(currentMonthObj.month);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(now.getFullYear(), now.getMonth(), now.getDate()));

  const [selectedSlot, setSelectedSlot] = useState<string>('12:00');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const filteredServices = activeTab === 'all'
    ? SERVICES
    : SERVICES.filter((s) => s.category === activeTab);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const canGoPrev = viewYear === nextMonthObj.year && viewMonth === nextMonthObj.month;
  const canGoNext = viewYear === currentMonthObj.year && viewMonth === currentMonthObj.month;

  const prevMonth = () => {
    if (canGoPrev) {
      setViewYear(currentMonthObj.year);
      setViewMonth(currentMonthObj.month);
    }
  };

  const nextMonth = () => {
    if (canGoNext) {
      setViewYear(nextMonthObj.year);
      setViewMonth(nextMonthObj.month);
    }
  };

  const isDateBookable = (dayNum: number) => {
    if (viewYear === now.getFullYear() && viewMonth === now.getMonth()) {
      return dayNum >= now.getDate();
    }
    if (viewYear === nextMonthObj.year && viewMonth === nextMonthObj.month) {
      return true;
    }
    return false;
  };

  const isToday = (dayNum: number) => {
    return viewYear === now.getFullYear() && viewMonth === now.getMonth() && dayNum === now.getDate();
  };

  const isSelected = (dayNum: number) => {
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === dayNum
    );
  };

  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  const isSlotBooked = (slot: string) => {
    const key = `${getDateKey(selectedDate)}_${slot}`;
    return bookedSlots.includes(key);
  };

  const formattedSelectedDate = `${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()].toLowerCase().slice(0, -1)}я ${selectedDate.getFullYear()}`;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleaned = rawVal.replace(/[^\d+]/g, '');
    const formatted = cleaned.startsWith('+')
      ? '+' + cleaned.slice(1).replace(/\+/g, '')
      : cleaned.replace(/\+/g, '');
    setClientPhone(formatted);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Пожалуйста, заполните имя и номер телефона.');
      return;
    }

    const digitsOnly = clientPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      alert('Пожалуйста, введите корректный номер телефона (не менее 10 цифр).');
      return;
    }

    const currentSlotKey = `${getDateKey(selectedDate)}_${selectedSlot}`;
    if (bookedSlots.includes(currentSlotKey)) {
      alert('Это время уже занято. Пожалуйста, выберите другое свободное окно.');
      return;
    }

    setIsSubmitting(true);

    const messageText = 
      `🌸 *Новая запись к Наталии!*\n\n` +
      `👤 *Клиент:* ${clientName}\n` +
      `📞 *Телефон:* ${clientPhone}\n` +
      `✨ *Услуга:* ${selectedService.volume} (${selectedService.title})\n` +
      `📅 *Дата:* ${formattedSelectedDate}\n` +
      `⏰ *Время:* ${selectedSlot}\n` +
      `💰 *Стоимость:* ${selectedService.price.toLocaleString('ru-RU')} ₽`;

    try {
      await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TG_CHAT_ID,
          text: messageText,
          parse_mode: 'Markdown'
        })
      });
    } catch (err) {
      console.error('Ошибка отправки в Telegram:', err);
    } finally {
      setIsSubmitting(false);
      setBookedSlots(prev => [...prev, currentSlotKey]);
      setIsSuccess(true);
    }
  };

  return (
    <div className="dark-theme-wrapper">
      <div className="ambient-blur blur-pink" />
      <div className="ambient-blur blur-graphite" />

      <main className="app-shell">
        <header className="profile-header">
          <div className="avatar-frame">
            <img
              src="/natalia.jpg"
              alt="Мастер Наталия"
              className="master-photo"
            />
            <span className="live-status-dot" title="Онлайн-запись активна" />
          </div>
          <div className="profile-info">
            <span className="badge-experience">Опыт 3 года • Гарантия 3 дня</span>
            <h1 className="master-title">Наталия</h1>
            <p className="master-subtitle">Мастер по наращиванию и ламинированию ресниц</p>
            <a
              href="https://instagram.com/natalia.yo.lash"
              target="_blank"
              rel="noreferrer"
              className="social-tag"
            >
              <span>@natalia.yo.lash</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          </div>
        </header>

        <section className="highlights-grid">
          <div className="highlight-pill">
            <span className="icon">✨</span>
            <span>Трендовые эффекты, лучи и цветные ресницы <strong>входят в стоимость</strong></span>
          </div>
          <div className="highlight-pill">
            <span className="icon">🛋️</span>
            <span>Удобная анатомическая <strong>кушетка-реклайнер</strong></span>
          </div>
        </section>

        <div className="category-tabs">
          <button
            type="button"
            className={`cat-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Все услуги
          </button>
          <button
            type="button"
            className={`cat-btn ${activeTab === 'lash' ? 'active' : ''}`}
            onClick={() => setActiveTab('lash')}
          >
            Наращивание (~1,5 ч)
          </button>
          <button
            type="button"
            className={`cat-btn ${activeTab === 'lam' ? 'active' : ''}`}
            onClick={() => setActiveTab('lam')}
          >
            Ламинирование (~40 мин)
          </button>
        </div>

        <section className="services-stack">
          {filteredServices.map((item) => {
            const isItemSel = selectedService.id === item.id;
            return (
              <div
                key={item.id}
                className={`service-card ${isItemSel ? 'selected' : ''}`}
                onClick={() => setSelectedService(item)}
              >
                <div className="service-main">
                  <div className="service-title-row">
                    <span className="volume">{item.volume}</span>
                    {item.badge && <span className="badge-hot">{item.badge}</span>}
                  </div>
                  <span className="sub">{item.title}</span>
                  <span className="duration">⏱ {item.duration}</span>
                </div>
                <div className="service-pricing">
                  <div className="price">{item.price.toLocaleString('ru-RU')} ₽</div>
                  <div className={`radio-mark ${isItemSel ? 'checked' : ''}`}>
                    {isItemSel ? '✓' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="calendar-block">
          <div className="calendar-month-nav">
            <button 
              type="button" 
              className={`cal-nav-btn ${!canGoPrev ? 'disabled' : ''}`} 
              disabled={!canGoPrev}
              onClick={prevMonth}
            >
              ‹
            </button>
            <div className="cal-title-wrapper">
              <h3>{MONTH_NAMES[viewMonth]} {viewYear}</h3>
              <span className="cal-subtitle">Выберите дату записи</span>
            </div>
            <button 
              type="button" 
              className={`cal-nav-btn ${!canGoNext ? 'disabled' : ''}`} 
              disabled={!canGoNext}
              onClick={nextMonth}
            >
              ›
            </button>
          </div>

          <div className="calendar-week-header">
            {WEEK_DAYS.map((wd) => (
              <span key={wd} className="week-day-title">{wd}</span>
            ))}
          </div>

          <div className="calendar-days-grid">
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="cal-cell empty" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const bookable = isDateBookable(day);
              const active = isSelected(day) && bookable;
              const today = isToday(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={!bookable}
                  className={`cal-cell day ${active ? 'active' : ''} ${today ? 'today' : ''} ${!bookable ? 'disabled' : ''}`}
                  onClick={() => {
                    if (bookable) {
                      setSelectedDate(new Date(viewYear, viewMonth, day));
                    }
                  }}
                >
                  <span>{day}</span>
                  {today && !active && <span className="today-dot" />}
                </button>
              );
            })}
          </div>

          <div className="slots-header">
            <span>Окна на <strong>{formattedSelectedDate}</strong>:</span>
          </div>
          <div className="time-slots-grid">
            {SLOTS.map((slot) => {
              const booked = isSlotBooked(slot);
              const active = selectedSlot === slot && !booked;

              return (
                <button
                  key={slot}
                  type="button"
                  disabled={booked}
                  className={`time-pill ${active ? 'active' : ''} ${booked ? 'booked' : ''}`}
                  onClick={() => !booked && setSelectedSlot(slot)}
                  title={booked ? 'Время уже забронировано' : 'Доступно для записи'}
                >
                  <span>{slot}</span>
                  {booked && <small className="slot-booked-label">Занято</small>}
                </button>
              );
            })}
          </div>
        </section>

        <div className="main-action-wrapper">
          <button
            type="button"
            className="primary-book-btn"
            disabled={isSlotBooked(selectedSlot)}
            onClick={() => setShowModal(true)}
          >
            <div className="btn-left">
              <span className="btn-title">Записаться к Наталии</span>
              <span className="btn-subtitle">
                {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()].toLowerCase().slice(0, 3)} в {selectedSlot} • {selectedService.volume}
              </span>
            </div>
            <div className="btn-right">
              <span className="btn-price">{selectedService.price.toLocaleString('ru-RU')} ₽</span>
              <span className="btn-arrow">→</span>
            </div>
          </button>
        </div>

        {showModal && (
          <div className="modal-backdrop" onClick={() => !isSubmitting && setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-grabber" />

              {!isSuccess ? (
                <form onSubmit={handleBooking} className="booking-modal-form">
                  <h2>Подтверждение записи</h2>
                  <div className="selected-summary-card">
                    <p><strong>Мастер:</strong> Наталия (@natalia.yo.lash)</p>
                    <p><strong>Услуга:</strong> {selectedService.volume} ({selectedService.title})</p>
                    <p><strong>Дата и время:</strong> {formattedSelectedDate}, {selectedSlot}</p>
                    <p><strong>Итого к оплате:</strong> {selectedService.price.toLocaleString('ru-RU')} ₽</p>
                  </div>

                  <div className="form-fields">
                    <label>Ваше имя</label>
                    <input
                      type="text"
                      placeholder="Например, Екатерина"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                    />

                    <label>Номер телефона</label>
                    <input
                      type="tel"
                      inputMode="tel"
                      placeholder="+7 999 123 45 67"
                      value={clientPhone}
                      onChange={handlePhoneChange}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="confirm-submit-btn" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Отправляем заявку...' : 'Подтвердить запись'}
                  </button>
                </form>
              ) : (
                <div className="success-state">
                  <div className="success-check-badge">✓</div>
                  <h2>Запись создана!</h2>
                  <p>
                    Наталия ожидает вас <strong>{formattedSelectedDate} в {selectedSlot}</strong>.
                  </p>
                  <p className="sub-note">
                    Уведомление отправлено мастеру в Telegram. Номер клиента: <strong>{clientPhone}</strong>.
                  </p>
                  <button
                    type="button"
                    className="close-sheet-btn"
                    onClick={() => {
                      setIsSuccess(false);
                      setShowModal(false);
                      setClientName('');
                      setClientPhone('');
                    }}
                  >
                    Понятно
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}