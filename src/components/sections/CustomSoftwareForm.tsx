'use client';

import { FormEvent, useState } from 'react';

const initialState = {
  name: '',
  email: '',
  company: '',
  scope: '',
  budget: ''
};

export function CustomSoftwareForm() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Informe seu nome.';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) nextErrors.email = 'E-mail inválido.';
    if (!form.company.trim()) nextErrors.company = 'Informe a empresa.';
    if (!form.scope.trim()) nextErrors.scope = 'Conte um pouco sobre o desafio.';
    if (!form.budget.trim()) nextErrors.budget = 'Selecione uma faixa de orçamento.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setStatus('success');
    // Aqui conectaremos com o backend/analytics futuramente
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  return (
    <section className="section" id="contato" aria-labelledby="custom-software-title">
      <div className="container">
        <p className="tagline">SOFTWARE SOB MEDIDA</p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'center' }}>
          <div>
            <h2 id="custom-software-title" className="section-title">
              Conte seu desafio e receba um plano em até 48h
            </h2>
            <p className="section-subtitle">
              Validamos escopo, riscos e arquitetura para garantir previsibilidade e velocidade desde o kick-off.
            </p>
            <div className="banner">
              <span>⏱️</span>
              <span>Resposta em até 48h úteis</span>
            </div>
          </div>
          <form className="card" onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <label>
                <span>Nome*</span>
                <input
                  className="input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby="name-error"
                  required
                />
                {errors.name && (
                  <small id="name-error" style={{ color: '#ff8080' }}>
                    {errors.name}
                  </small>
                )}
              </label>
              <label>
                <span>E-mail corporativo*</span>
                <input
                  className="input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby="email-error"
                  required
                />
                {errors.email && (
                  <small id="email-error" style={{ color: '#ff8080' }}>
                    {errors.email}
                  </small>
                )}
              </label>
              <label>
                <span>Empresa*</span>
                <input
                  className="input"
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  aria-invalid={!!errors.company}
                  aria-describedby="company-error"
                  required
                />
                {errors.company && (
                  <small id="company-error" style={{ color: '#ff8080' }}>
                    {errors.company}
                  </small>
                )}
              </label>
              <label>
                <span>Faixa de orçamento*</span>
                <select
                  className="input"
                  name="budget"
                  value={form.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                  aria-invalid={!!errors.budget}
                  aria-describedby="budget-error"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="<100k">Até R$ 100k</option>
                  <option value="100-300k">R$ 100k - R$ 300k</option>
                  <option value=">300k">Acima de R$ 300k</option>
                </select>
                {errors.budget && (
                  <small id="budget-error" style={{ color: '#ff8080' }}>
                    {errors.budget}
                  </small>
                )}
              </label>
            </div>
            <label style={{ display: 'block', marginTop: 12 }}>
              <span>Desafio ou oportunidade*</span>
              <textarea
                className="input"
                name="scope"
                value={form.scope}
                onChange={(e) => handleChange('scope', e.target.value)}
                aria-invalid={!!errors.scope}
                aria-describedby="scope-error"
                required
              />
              {errors.scope && (
                <small id="scope-error" style={{ color: '#ff8080' }}>
                  {errors.scope}
                </small>
              )}
            </label>
            <button type="submit" className="button primary" style={{ marginTop: 16 }}>
              Enviar briefing
            </button>
            {status === 'success' && (
              <p role="status" style={{ color: '#d8ff6b', margin: '12px 0 0' }}>
                Obrigado! Retornaremos em até 48h com o plano sob medida.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
