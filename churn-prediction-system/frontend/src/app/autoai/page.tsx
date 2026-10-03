export default function AutoAIPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">IBM AutoAI Workflow</h1>
      
      <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-md text-yellow-800 text-sm">
        <strong>Disclaimer:</strong> IBM AutoAI experiments are performed externally in IBM Watson Studio. This application does not fabricate AutoAI results. This page serves to document the required integration workflow for real-world deployments.
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Experiment Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-700">1. Dataset</h3>
            <p className="text-sm text-gray-600 mt-1">Exported &apos;customer_churn.csv&apos; containing numerical and categorical features.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">2. Target Variable</h3>
            <p className="text-sm text-gray-600 mt-1">&apos;churn&apos; (Binary Classification)</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-semibold text-gray-700">3. Features Used</h3>
            <p className="text-sm text-gray-600 mt-1">
              age, gender, tenure, contract_type, monthly_charges, total_charges, payment_method, 
              internet_service, number_of_services, complaints, customer_support_calls, usage_frequency, late_payments
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">IBM Watson Studio Workflow</h2>
        
        <ol className="list-decimal list-inside space-y-4 text-gray-700 ml-4">
          <li><strong>Prepare Dataset:</strong> Extract validated customer data from the local MySQL database.</li>
          <li><strong>Upload to IBM Watson Studio:</strong> Create a new project and add the dataset as a Data Asset.</li>
          <li><strong>Initialize AutoAI:</strong> Add a new AutoAI experiment to the project.</li>
          <li><strong>Configure Target:</strong> Select the dataset and set &apos;churn&apos; as the prediction column.</li>
          <li><strong>Run Experiment:</strong> Execute the AutoAI pipeline generation process.</li>
          <li><strong>Compare Pipelines:</strong> Review the automatically generated pipelines (e.g., SnapML, XGBoost, Random Forest with various feature engineering enhancements).</li>
          <li><strong>Evaluate Metrics:</strong> Select the pipeline with the best ROC-AUC and F1 Score for this imbalanced dataset.</li>
          <li><strong>Deploy:</strong> Save the model and deploy it via IBM Watson Machine Learning (WML) as a REST API endpoint.</li>
        </ol>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Integration Instructions</h2>
        <p className="text-sm text-gray-600">
          Once the AutoAI model is deployed via IBM WML, update the environment variables to connect this application&apos;s `/predict` route to IBM instead of the local Python FastAPI service:
        </p>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono overflow-x-auto">
          IBM_WML_API_KEY=&quot;your_api_key&quot;<br/>
          IBM_WML_ENDPOINT=&quot;https://us-south.ml.cloud.ibm.com/ml/v4/deployments/...&quot;<br/>
          USE_IBM_AUTOAI=&quot;true&quot;
        </div>
      </div>
    </div>
  );
}
