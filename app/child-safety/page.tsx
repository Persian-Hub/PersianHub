import type { Metadata } from "next"
import { Shield, AlertTriangle, Phone, Mail, Users, Eye, BookOpen, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Safety Standards Against Child Sexual Abuse | Persian Hub",
  description:
    "Persian Hub's comprehensive safety standards and zero-tolerance policy against child sexual abuse and exploitation (CSAE).",
}

export default function ChildSafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Safety Standards Against Child Sexual Abuse and Exploitation (CSAE)
          </h1>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Effective Date:</strong> 17 August 2025
            </p>
            <p>
              <strong>Last Updated:</strong> 17 August 2025
            </p>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              At Persian Hub, we are committed to creating a safe, respectful, and trustworthy platform for our users.
              We strongly oppose and have zero tolerance for any form of child sexual abuse and exploitation (CSAE).
            </p>
            <p className="text-gray-700 mt-4">
              This document outlines our safety standards, policies, and practices to prevent and respond to CSAE
              content and activity across our app and services.
            </p>
          </CardContent>
        </Card>

        {/* Zero Tolerance Policy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              1. Zero-Tolerance Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Persian Hub strictly prohibits the creation, storage, sharing, or promotion of child sexual abuse
                material (CSAM) or any content that exploits or endangers children.
              </AlertDescription>
            </Alert>
            <p className="text-gray-700">
              Any account found to be involved in such activity will be immediately suspended and reported to relevant
              authorities.
            </p>
          </CardContent>
        </Card>

        {/* Detection and Reporting */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-blue-600" />
              2. Detection and Reporting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              We actively monitor for harmful content through a combination of automated systems and manual moderation.
            </p>
            <p className="text-gray-700">
              Suspicious activity or reported content is reviewed promptly by our moderation team.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Confirmed cases of CSAE content or behavior are reported to:
              </h4>
              <ul className="space-y-2 text-blue-800">
                <li>• Australian eSafety Commissioner</li>
                <li>• National Center for Missing & Exploited Children (NCMEC) where applicable</li>
                <li>• Other relevant law enforcement bodies worldwide</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-6 w-6 text-green-600" />
              3. User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-gray-700">
                <strong>Users are strictly forbidden from:</strong>
              </p>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li>• Uploading, sharing, or linking to CSAE content</li>
                <li>• Using Persian Hub to groom, contact, or exploit minors in any way</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">
                We encourage all users to report harmful behavior immediately through the in-app Report function or by
                contacting us at <strong>security@persianhub.com.au</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Protections for Minors */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-purple-600" />
              4. Protections for Minors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 text-gray-700">
              <li>• Persian Hub is not directed at children under 16</li>
              <li>• We do not knowingly collect personal data from children under this age</li>
              <li>
                • If we become aware that a child has provided us with personal information, we will take immediate
                steps to delete it
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Law Enforcement Cooperation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-indigo-600" />
              5. Law Enforcement Cooperation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 text-gray-700">
              <li>• We fully cooperate with law enforcement investigations related to CSAE</li>
              <li>
                • Where legally required, we may preserve and disclose account information to assist with investigations
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Staff Training */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-orange-600" />
              6. Staff Training & Accountability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 text-gray-700">
              <li>• Our team receives regular training on CSAE risks, detection, and reporting obligations</li>
              <li>• We maintain strict internal guidelines to ensure timely and effective response to CSAE reports</li>
            </ul>
          </CardContent>
        </Card>

        {/* How to Report */}
        <Card className="mb-8 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-700">
              <Mail className="h-6 w-6" />
              7. How to Report CSAE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 font-medium">If you encounter CSAE content or behavior on Persian Hub:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm font-bold">1</span>
                </div>
                <p className="text-red-800">Use the Report function available in the app, or</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm font-bold">2</span>
                </div>
                <p className="text-red-800">
                  Email us directly at <strong>security@persianhub.com.au</strong> with as much detail as possible
                </p>
              </div>
            </div>
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                We will treat your report with urgency and confidentiality.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Continuous Improvement */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 text-teal-600" />
              8. Continuous Improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">We regularly review and update our safety standards in line with:</p>
            <ul className="space-y-2 text-gray-700 ml-4">
              <li>• Best practices recommended by global child protection agencies</li>
              <li>• The Australian eSafety Commissioner guidelines</li>
              <li>• The UNICEF and WePROTECT Global Alliance standards</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 mb-4">For any questions or concerns regarding our CSAE standards:</p>
            <div className="flex items-center gap-2 text-blue-800">
              <Mail className="h-4 w-4" />
              <span>
                Email: <strong>security@persianhub.com.au</strong>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <div className="mt-8 text-center">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Emergency:</strong> If you believe a child is in immediate danger, contact your local emergency
              services (000 in Australia) immediately.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
