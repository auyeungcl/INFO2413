export const DisplayFormikState = (props) => (
  <div style={{ margin: "1rem 0", background: "#f6f8fa", padding: ".5rem" }}>
    <strong>Injected Formik props (Just debugging)</strong>
    <div style={{}}>
      <code>touched:</code> {JSON.stringify(props.touched, null, 2)}
    </div>
    <div>
      <code>errors:</code> {JSON.stringify(props.errors, null, 2)}
    </div>
    <div>
      <code>values:</code> {JSON.stringify(props.values, null, 2)}
    </div>
    <div>
      <code>isSubmitting:</code> {JSON.stringify(props.isSubmitting, null, 2)}
    </div>
  </div>
);

export const getDataByID = (collection, id) => {
  let doc = "";
  collection.forEach((element) => {
    if (element.id === id) {
      doc = element.data();
    }
  });
  return doc;
};

export const getDataBySeedNameField = (element, value) => {
  let doc = "";

  if (element.data().seedName === value) {
    doc = element;
  }

  return doc;
};
