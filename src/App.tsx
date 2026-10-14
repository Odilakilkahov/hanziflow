import { MotionConfig } from 'framer-motion'
import { Root } from '@/pages/Root'

/** Точка входа. reducedMotion="user": Framer Motion уважает системную настройку «меньше движения». */
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Root />
    </MotionConfig>
  )
}
