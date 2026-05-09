'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api-client';

type Gender = 'male' | 'female' | 'other';
type Status = 'idle' | 'submitting' | 'success' | 'error';

const GENDER_OPTIONS: Array<{ value: Gender; label: string }> = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

function validatePhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return 'Vui lòng nhập số điện thoại';
  const digits = trimmed.replace(/[^\d]/g, '');
  if (digits.length < 8) return 'Số điện thoại quá ngắn (tối thiểu 8 chữ số)';
  if (digits.length > 15) return 'Số điện thoại quá dài (tối đa 15 chữ số)';
  return null;
}

export default function ConsultationForm() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const phoneError = phoneTouched ? validatePhone(phone) : null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPhoneTouched(true);
    const err = validatePhone(phone);
    if (err) {
      setError(err);
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setError(null);
    try {
      await api.submitConsultation({
        name: name.trim() || undefined,
        gender: gender || undefined,
        phone: phone.trim(),
        note: note.trim() || undefined,
      });
      setStatus('success');
      setName('');
      setGender('');
      setPhone('');
      setNote('');
      setPhoneTouched(false);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  }

  if (status === 'success') {
    return (
      <div className="consult-form-card consult-success" role="status">
        <div className="consult-success-mark" aria-hidden>
          {'✓\uFE0E'}
        </div>
        <h2>Đã nhận yêu cầu!</h2>
        <p>
          R.E.P.O đã nhận được yêu cầu của bạn. Đội ngũ shop sẽ săn acc và
          liên hệ với bạn trong vòng <strong>30 phút</strong> (giờ hành chính,
          9:00–23:00) qua Zalo / điện thoại.
        </p>
        <button
          type="button"
          className="consult-submit consult-submit-ghost"
          onClick={() => setStatus('idle')}
        >
          Gửi yêu cầu khác
        </button>
      </div>
    );
  }

  const isSubmitting = status === 'submitting';

  return (
    <form className="consult-form-card" onSubmit={onSubmit} noValidate>
      <h2 className="consult-form-title">Đăng ký tìm acc PUBG</h2>
      <p className="consult-form-sub">
        Nhập thông tin — R.E.P.O liên hệ trong 30 phút.
      </p>

      <div className="consult-field">
        <label htmlFor="cf-name">Họ và tên / Nickname</label>
        <input
          id="cf-name"
          type="text"
          autoComplete="name"
          maxLength={120}
          placeholder="Nguyễn Văn A / Khoa Tank PUBG"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="consult-field">
        <span className="consult-label">Giới tính</span>
        <div className="consult-radio-row" role="radiogroup" aria-label="Giới tính">
          {GENDER_OPTIONS.map((opt) => {
            const checked = gender === opt.value;
            return (
              <label
                key={opt.value}
                className={`consult-radio ${checked ? 'is-checked' : ''}`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={opt.value}
                  checked={checked}
                  onChange={() => setGender(opt.value)}
                  disabled={isSubmitting}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="consult-field">
        <label htmlFor="cf-phone">
          Số điện thoại / Zalo <span className="consult-required" aria-hidden>*</span>
          <span className="visually-hidden"> (bắt buộc)</span>
        </label>
        <input
          id="cf-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          maxLength={30}
          placeholder="0901 234 567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setPhoneTouched(true)}
          disabled={isSubmitting}
          aria-invalid={!!phoneError}
          aria-describedby={phoneError ? 'cf-phone-err' : undefined}
          className={phoneError ? 'has-error' : ''}
        />
        {phoneError && (
          <span id="cf-phone-err" className="consult-field-error">
            {phoneError}
          </span>
        )}
      </div>

      <div className="consult-field">
        <label htmlFor="cf-note">Mô tả acc cần tìm (rank, skin, ngân sách)</label>
        <textarea
          id="cf-note"
          rows={4}
          maxLength={1000}
          placeholder="VD: Cần acc Conqueror SEA, có Glacier M416 + AWM, KDR > 4, ngân sách 5–8tr"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {status === 'error' && error && (
        <div className="consult-form-error" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="consult-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Đang gửi…' : 'Gửi yêu cầu tìm acc'}
      </button>

      <p className="consult-form-note">
        Bằng việc gửi form, bạn đồng ý cho R.E.P.O liên hệ qua SĐT đã cung cấp
        để tư vấn acc PUBG. Thông tin chỉ dùng nội bộ — không spam, không chia sẻ.
      </p>
    </form>
  );
}
