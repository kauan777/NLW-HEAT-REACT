import { useContext } from 'react'
import styles from './App.module.scss'
import { LoginBox } from './components/LoginBox'
import { MessageList } from './components/MessageList'
import { SendMessageForm } from './components/SendMessageForm'
import { AuthContext } from './contexts/auth'
//module serve para que essa estilização sja especifica desse arquivo

export function App() {

  const { user } = useContext(AuthContext);

  return (
   <main className={`${styles.contentWrapper} ${!!user ? styles.contentSignend : ''}`}>
    <MessageList/>
    {!!user ? <SendMessageForm/> : <LoginBox/>}
   </main>
  )
}

