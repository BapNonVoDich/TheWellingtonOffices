// src/emails/ConsignmentNotificationEmail.tsx
import { Html, Head, Body, Container, Heading, Section, Text } from '@react-email/components';

interface EmailProps {
  contactName: string;
  phone: string;
  email: string;
  propertyAddress: string;
  propertyType: string;
  area: string;
  price: string;
  description: string;
}

export default function ConsignmentNotificationEmail({
  contactName, phone, email, propertyAddress, propertyType, area, price, description
}: EmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', padding: '20px' }}>
        <Container>
          <Heading>Thông tin Ký gửi Mới</Heading>
          <Section style={{ border: '1px solid #eee', padding: '20px', borderRadius: '5px' }}>
            <Text><strong>Tên người gửi:</strong> {contactName}</Text>
            <Text><strong>Số điện thoại:</strong> {phone}</Text>
            <Text><strong>Email:</strong> {email}</Text>
            <hr />
            <Text><strong>Địa chỉ BĐS:</strong> {propertyAddress}</Text>
            <Text><strong>Loại hình:</strong> {propertyType}</Text>
            <Text><strong>Diện tích:</strong> {area} m²</Text>
            <Text><strong>Giá mong muốn:</strong> ${price}/tháng</Text>
            <Text><strong>Mô tả thêm:</strong></Text>
            <Text>{description}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}