// src/emails/ContactFormEmail.tsx
import { Html, Head, Body, Container, Heading, Section, Text } from '@react-email/components';

interface EmailProps {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ContactFormEmail({ name, email, phone, message }: EmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', padding: '20px' }}>
        <Container>
          <Heading>Tin nhắn Liên hệ Mới</Heading>
          <Section style={{ border: '1px solid #eee', padding: '20px', borderRadius: '5px' }}>
            <Text><strong>Tên người gửi:</strong> {name}</Text>
            <Text><strong>Email:</strong> {email}</Text>
            <Text><strong>Số điện thoại:</strong> {phone}</Text>
            <hr />
            <Text><strong>Nội dung:</strong></Text>
            <Text>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}