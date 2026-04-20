import React from 'react';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function ProductCard({ item }: { item: any }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph numberOfLines={2}>{item.description}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Link href={`/products/${item.id}`}>
          <Button>View</Button>
        </Link>
        <View style={{ flex: 1 }} />
        <Button mode="contained">Add</Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { margin: 8 },
});
