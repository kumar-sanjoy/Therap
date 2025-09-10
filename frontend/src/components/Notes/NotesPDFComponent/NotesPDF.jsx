import React from 'react';

const NotesPDF = ({ title, notes, Document, Page, Text, View, StyleSheet, Font }) => {
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

  // Process notes to remove markdown formatting
  const processNote = (note) => {
    return note
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
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 20,
      color: '#343434',
      fontFamily: "Hind Siliguri",
    },
    subheader: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 30,
      color: '#666666',
      fontFamily: "Hind Siliguri",
    },
    noteTitle: {
      fontSize: 14,
      marginTop: 20,
      marginBottom: 10,
      color: '#343434',
      fontFamily: "Hind Siliguri",
    },
    noteContent: {
      fontSize: 11,
      lineHeight: 1.4,
      marginBottom: 15,
      color: '#333333',
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>{title}</Text>
        <Text style={styles.subheader}>Generated Notes</Text>

        {/* Notes Content */}
        {notes.map((note, index) => (
          <View key={index}>
            <Text style={styles.noteTitle}>Note {index + 1}</Text>
            <Text style={styles.noteContent}>
              {processNote(note)}
            </Text>
          </View>
        ))}

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

export default NotesPDF; 