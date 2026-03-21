# 🎾 Especificación de Aplicación: Gestión de Torneo de Pádel

## 1. 📌 Overview
Aplicación web para gestionar un torneo de pádel de un solo día con:
* **Capacidad:** 2 canchas disponibles.
* **Formato híbrido:** Grupos + eliminación directa.

El sistema está diseñado para:
* **Operación:** Vía HTTP.
* **Visualización:** Pública y en tiempo real.
* **Eficiencia:** Maximizar el uso de canchas (sin tiempos muertos).

## 2. 🎯 Objetivos
### Objetivo principal
Permitir organizar y ejecutar un torneo de forma eficiente, asegurando:
* Fluidez operativa.
* Actualización automática del cuadro.
* Transparencia para jugadores.

### Objetivos secundarios
* Reducir carga manual del organizador.
* Mantener canchas siempre ocupadas.
* Generar engagement previo al evento.

## 3. 👥 Usuarios
### Admin (Organizador)
* Carga de participantes.
* Configuración del torneo.
* Reconfirmación de asistencia (Check-in).
* Carga de resultados.

### Público / Jugadores
* Visualización de cuadros y tablas.
* Ver partidos actuales y próximos.
* Seguimiento del progreso en tiempo real.

## 4. 📅 Flujo del Torneo
### Pre-evento (Hasta 3 semanas antes)
1. Publicación del torneo.
2. Inscripción vía WhatsApp.
3. Recolección de datos: Nombres y categorías de jugadores.

### Día del evento
1. **Check-in:** Reconfirmación manual de parejas y activación de participantes.
2. **Generación del torneo:** Armado de grupos, cálculo de ranking y aplicación de configuración.
3. **Ejecución en vivo:** Sugerencia inteligente de partidos, carga de resultados y actualización automática.
4. **Finalización:** Determinación de ganador y visualización pública final.

## 5. ⚙️ Reglas del Torneo
* **Participantes:** Entre 8 y 18 parejas.
* **Formato:** Fase de grupos + eliminación directa.
* **Partidos:** 1 set por partido.
    * A 4 games (3-3 → tiebreak).
    * A 6 games (5-5 → tiebreak).
* **Grupos:** Configurables de 3 o 4 parejas.

## 6. 🧠 Lógica del Sistema (Core)

### 6.1 Ranking de parejas
* **Fórmula:** `Nivel pareja = (nivel jugador A + nivel jugador B) / 2`
* **Uso:** Balancear grupos y ordenar *seeds*.

### 6.2 Generación de grupos y cuadro
* **Inputs:** Participantes reconfirmados y configuración del torneo.
* **Outputs:** Grupos balanceados por nivel y cuadro de eliminación directa.

### 6.3 Scheduling inteligente (KEY FEATURE)
* **Objetivo:** Mantener SIEMPRE las 2 canchas ocupadas.
* **Variables:** Disponibilidad de canchas, partidos pendientes, dependencias (resultados previos) y estado de fase.
* **Priorización:** 
    1. Partidos sin dependencias.
    2. Partidos que desbloquean otros.
    3. Fases más atrasadas.
* **Output:** Sugerencia de siguientes partidos para entrar a cancha.

### 6.4 Actualización vía HTTP
* Cada resultado ingresado dispara:
    * Actualización de tabla de grupos.
    * Definición de clasificados.
    * Desbloqueo de partidos en el cuadro.
    * Recálculo de prioridades de juego.

## 7. 🧩 Edge Case — Mejores no clasificados
* **📌 Problema:** Necesidad de completar el cuadro (ej. octavos o cuartos) con parejas que no clasificaron directamente.
* **🎯 Objetivo:** Seleccionar automáticamente las mejores parejas eliminadas.
* **📊 Métrica principal:** `Score = Games Ganados - Games Perdidos`.
* **🧠 Desempates:** Partidos ganados, Head-to-head, diferencia de sets (futuro), sorteo.
* **📤 Output:** Ranking de no clasificados y selección de Top N ("Lucky losers").
* **🧪 Consideraciones:** Normalización para grupos de distinto tamaño y posible sesgo según duración de sets (4 vs 6).

## 8. 🖥️ Funcionalidades

### 8.1 Admin
* **Participantes:** Alta/edición y Check-in rápido.
* **Configuración:** Sets por fase, tamaño de grupos y formato general.
* **Operación:** Carga de resultados, vista de sugerencias de *scheduling* y estado en vivo.

### 8.2 Público (Web abierta)
* **Visualización:** Grupos, cuadro de eliminación y partidos en juego.
* **En vivo:** Actualización mediante HTTP (polling/refresco) de próximos partidos sugeridos ("Prepárense").
* **Engagement:** Link a WhatsApp de la organización, info del torneo y premios.

## 9. 🎨 UI/UX
1. **Landing:** Información general y CTA de inscripción.
2. **Vista en vivo:** Estado de Cancha 1 y Cancha 2, seguidos de "Próximos a jugar".
3. **Cuadro:** Tablas de grupos dinámicas y bracket de eliminación.
4. **Admin Panel:** Interfaz optimizada para carga rápida de resultados y check-in.

## 10. 🧪 Edge Cases Adicionales
* Jugadores que no se presentan.
* Lesiones o abandonos durante el set.
* Número impar de parejas (manejo de *BYEs*).
* Reconfiguración manual de grupos de último momento.
* Criterios de empates complejos en puntos.

## 11. 🔔 Engagement
* **Pre-torneo:** Comunicación 3 semanas antes e inscripciones fluidas.
* **Durante:** Pantallas públicas visibles en el predio para una experiencia profesional.
* **Post:** Destaque de ganadores y galería final.

## 12. 🏗️ Consideraciones Técnicas
* **Backend:** Endpoints públicos (lectura) y privados (escritura con seguridad simple).
* **Frontend:** React Query para mantener el estado sincronizado vía HTTPS. UI clara, rápida y *mobile-friendly*.
* **Escalabilidad:** Optimizado para 12-18 parejas con automatización completa de grupos y cuadros.
