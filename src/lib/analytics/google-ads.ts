'use client';

import { sendGAEvent } from '@next/third-parties/google';

const RESERVAR_HORARIO_CONVERSION_ID =
  'AW-18077342694/me4cCPCp87McEOa3-atD';

const CONTATO_WHATSAPP_CONVERSION_ID =
  'AW-18077342694/t9BeCJ_ZirkcEOa3-atD';

export function reportReservarHorarioConversion() {
  sendGAEvent('event', 'conversion', {
    send_to: RESERVAR_HORARIO_CONVERSION_ID,
    value: 1.0,
    currency: 'BRL',
  });
}

export function reportContatoWhatsappConversion() {
  sendGAEvent('event', 'conversion', {
    send_to: CONTATO_WHATSAPP_CONVERSION_ID,
    value: 1.0,
    currency: 'BRL',
  });
}
