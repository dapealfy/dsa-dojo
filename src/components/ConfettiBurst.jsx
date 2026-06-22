import confetti from 'canvas-confetti'

export default function ConfettiBurst({ fire = false }) {
  if (typeof window !== 'undefined' && fire) {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7ee787', '#d2a8ff', '#ffa657', '#56d364'],
    })
  }
  return null
}