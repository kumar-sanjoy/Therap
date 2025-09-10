import React from 'react';

const QuestionAnswerPDF = ({ question, answer, Document, Page, Text, View, StyleSheet, Font }) => {
  // Register Bengali font
  Font.register({
    family: 'Hind Siliguri',
    src: 'https://fonts.gstatic.com/s/hindsiliguri/v2/f2eEi2pbIa8eBfNwpUl0Am_MnNA9OgK8I1F23mNWOpE.ttf'
  });

  // Register fallback font
  Font.register({
    family: 'Roboto',
    src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.ttf'
  });

  // Process text to remove markdown formatting
  const processText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
      .replace(/`(.*?)`/g, '$1') // Remove code markers
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .trim();
  };

  // Create styles using the passed StyleSheet
  const styles = StyleSheet.create({
    page: {
      padding: 40,
      backgroundColor: "#fff",
      fontFamily: "Hind Siliguri",
    },
    header: {
      fontSize: 20,
      textAlign: 'center',
      marginBottom: 10,
      color: '#343434',
      fontFamily: "Hind Siliguri",
      fontWeight: 'bold',
    },
    subheader: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 30,
      color: '#666666',
      fontFamily: "Hind Siliguri",
    },
    sectionTitle: {
      fontSize: 16,
      marginTop: 25,
      marginBottom: 10,
      color: '#343434',
      fontFamily: "Hind Siliguri",
      fontWeight: 'bold',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: 5,
    },
    questionContent: {
      fontSize: 12,
      lineHeight: 1.5,
      marginBottom: 20,
      color: '#374151',
      fontFamily: "Hind Siliguri",
      backgroundColor: '#f9fafb',
      padding: 15,
      borderRadius: 8,
    },
    answerContent: {
      fontSize: 12,
      lineHeight: 1.6,
      marginBottom: 20,
      color: '#1f2937',
      fontFamily: "Hind Siliguri",
      backgroundColor: '#fef3c7',
      padding: 15,
      borderRadius: 8,
    },
    timestamp: {
      fontSize: 10,
      textAlign: 'center',
      marginTop: 20,
      color: '#9ca3af',
      fontFamily: "Hind Siliguri",
    },
    pageNumber: {
      position: 'absolute',
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 10,
      color: '#666666',
      fontFamily: "Hind Siliguri",
    },
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>Question & Answer</Text>
        <Text style={styles.subheader}>AI Tutor Response</Text>

        {/* Question Section */}
        <Text style={styles.sectionTitle}>Question</Text>
        <Text style={styles.questionContent}>
          {processText(question)}
        </Text>

        {/* Answer Section */}
        <Text style={styles.sectionTitle}>Answer</Text>
        <Text style={styles.answerContent}>
          {processText(answer)}
        </Text>

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          Generated on: {currentDate}
        </Text>

        {/* Page Number */}
        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

export default QuestionAnswerPDF;
