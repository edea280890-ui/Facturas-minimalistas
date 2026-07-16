import React from 'react';

export default function HeroSection() {
  return (
    <section className="px-4 py-16 text-center md:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Crea y envía facturas profesionales en minutos
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          El generador de facturas pensado para freelancers y pymes de Latinoamérica: completa un formulario
          simple y obtén un PDF listo para enviar a tu cliente, sin plantillas complicadas ni hojas de cálculo.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {/*
            TODO(Hotmart): reemplazar este href="#" por el enlace de checkout de
            Hotmart cuando esté disponible.
          */}
          <a
            href="#"
            className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-slate-800 sm:w-auto"
          >
            Comenzar ahora
          </a>
          <a
            href="#precios"
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-6 py-3 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-100 sm:w-auto"
          >
            Ver planes
          </a>
        </div>

        <p className="mt-4 text-sm text-slate-400">Sin tarjeta de crédito para empezar. Cancela cuando quieras.</p>
      </div>
    </section>
  );
}
