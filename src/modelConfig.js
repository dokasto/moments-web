/**
 * Model configuration — Florence-2 for image captioning.
 * Word extraction is algorithmic (stop-word filter on the caption).
 */
const modelConfig = {
  model: 'onnx-community/Florence-2-base-ft',
  dtype: {
    embed_tokens: 'fp32',
    vision_encoder: 'fp32',
    encoder_model: 'q4',
    decoder_model_merged: 'q4',
  },
};

export default modelConfig;
