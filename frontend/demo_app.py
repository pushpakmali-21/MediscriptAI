import streamlit as st
import requests
import json
from PIL import Image
import io

st.set_page_config(page_title="MediScript-AI Prototype", layout="wide")

st.title("MediScript-AI 🩺")
st.subheader("Intelligent Medical Document Processing")

st.markdown("Upload a prescription image to instantly digitize and analyze it.")

uploaded_file = st.file_uploader("Upload Prescription Image", type=["jpg", "jpeg", "png", "pdf"])

if uploaded_file is not None:
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("### Original Prescription")
        # Display the uploaded image
        image = Image.open(uploaded_file)
        st.image(image, use_container_width=True)
        
    with col2:
        st.write("### Extracted Clinical Data")
        
        if st.button("Process Prescription", type="primary"):
            with st.spinner("Analyzing with Vision Language Model..."):
                try:
                    # Reset file pointer
                    uploaded_file.seek(0)
                    files = {"file": (uploaded_file.name, uploaded_file.read(), uploaded_file.type)}
                    
                    # Assuming backend is running on localhost:8000
                    response = requests.post("http://localhost:8000/api/v1/extract", files=files)
                    
                    if response.status_code == 200:
                        data = response.json()
                        medications = data.get("medications", [])
                        diagnoses = data.get("diagnoses", [])
                        general_notes = data.get("general_notes", "")
                        source = data.get("source", "unknown")
                        
                        st.caption(f"Processed via: {source.upper()}")
                        
                        if not medications and not diagnoses and not general_notes:
                            st.warning("No clinical data found in the image.")
                            
                        if diagnoses:
                            st.write("#### 🩺 Diagnoses & Symptoms")
                            for diag in diagnoses:
                                st.markdown(f"- {diag}")
                            st.divider()
                                
                        if general_notes:
                            st.write("#### 📝 Clinical Notes")
                            st.info(general_notes)
                            st.divider()
                            
                        if medications:
                            st.write("#### 💊 Medications")
                            for med in medications:
                                with st.container():
                                    st.markdown(f"**{med.get('medicine_name', 'Unknown')}**")
                                    
                                    c1, c2, c3, c4 = st.columns(4)
                                    c1.metric("Dosage", med.get("dosage", "-"))
                                    c2.metric("Frequency", med.get("frequency", "-"))
                                    c3.metric("Duration", med.get("duration", "-"))
                                    c4.metric("Instruction", med.get("instructions", "-"))
                                    
                                    if "rag_context" in med:
                                        st.info(med["rag_context"])
                                    
                                    st.markdown("---")
                    else:
                        st.error(f"Error processing prescription. Backend returned status code: {response.status_code}")
                        st.write(response.text)
                except requests.exceptions.ConnectionError:
                    st.error("Could not connect to the backend API. Is it running on port 8000?")
                except requests.exceptions.RequestException as e:
                    st.error(f"Request error occurred: {e}")
                except json.JSONDecodeError as e:
                    st.error(f"Invalid response format: {e}")
                except Exception as e:
                    st.error(f"An unexpected error occurred: {e}")
